/**
 * File Watcher Module
 * Monitors data files for changes and triggers cache updates
 */

const chokidar = require('chokidar');
const path = require('path');

class FileWatcher {
  constructor() {
    this.watcher = null;
    this.changeCallback = null;
    this.debounceTimers = new Map();
    this.debounceDelay = 500; // 500ms debounce
  }

  initialize(onChangeCallback) {
    if (this.watcher) {
      console.warn('File watcher already initialized');
      return;
    }

    this.changeCallback = onChangeCallback;
    
    // Define files and patterns to watch
    const watchPaths = [
      path.join(__dirname, '../cost-tracking.json'),
      path.join(__dirname, '../cost-tracking.jsonl'),
      path.join(__dirname, '../error-log.jsonl'),
      path.join(__dirname, '../SMOKE_TEST_RESULTS.md'),
      path.join(__dirname, '../tests/**/*.json')
    ];

    // Initialize chokidar watcher
    this.watcher = chokidar.watch(watchPaths, {
      ignored: [
        /node_modules/,
        /\.git/,
        /\.DS_Store/,
        /Thumbs\.db/
      ],
      persistent: true,
      ignoreInitial: true, // Don't trigger on initial scan
      usePolling: false,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50
      }
    });

    // Set up event handlers
    this.watcher
      .on('change', (filePath) => this.handleFileChange(filePath, 'change'))
      .on('add', (filePath) => this.handleFileChange(filePath, 'add'))
      .on('unlink', (filePath) => this.handleFileChange(filePath, 'delete'))
      .on('error', (error) => {
        console.error('File watcher error:', error);
      })
      .on('ready', () => {
        console.log('📁 File watcher initialized and monitoring:');
        console.log('   - cost-tracking.json');
        console.log('   - cost-tracking.jsonl');
        console.log('   - error-log.jsonl');
        console.log('   - SMOKE_TEST_RESULTS.md');
        console.log('   - tests/**/*.json');
      });

    return this;
  }

  handleFileChange(filePath, event) {
    const relativePath = path.relative(path.join(__dirname, '..'), filePath);
    
    // Clear existing debounce timer for this file
    if (this.debounceTimers.has(filePath)) {
      clearTimeout(this.debounceTimers.get(filePath));
    }

    // Set new debounce timer
    const timer = setTimeout(() => {
      console.log(`📝 File ${event}: ${relativePath}`);
      
      if (this.changeCallback) {
        this.changeCallback(relativePath);
      }
      
      this.debounceTimers.delete(filePath);
    }, this.debounceDelay);

    this.debounceTimers.set(filePath, timer);
  }

  cleanup() {
    if (this.watcher) {
      console.log('🛑 Stopping file watcher...');
      
      // Clear all debounce timers
      this.debounceTimers.forEach(timer => clearTimeout(timer));
      this.debounceTimers.clear();
      
      // Close the watcher
      this.watcher.close();
      this.watcher = null;
      this.changeCallback = null;
      
      console.log('✅ File watcher stopped');
    }
  }

  // Get current watch status
  getStatus() {
    return {
      isWatching: !!this.watcher,
      watchedPaths: this.watcher ? this.watcher.getWatched() : {},
      pendingChanges: this.debounceTimers.size
    };
  }

  // Add additional files to watch
  addPath(filePath) {
    if (this.watcher) {
      this.watcher.add(filePath);
      console.log(`📁 Added to watch list: ${filePath}`);
    }
  }

  // Remove files from watch list
  removePath(filePath) {
    if (this.watcher) {
      this.watcher.unwatch(filePath);
      console.log(`📁 Removed from watch list: ${filePath}`);
    }
  }
}

// Export singleton instance
const fileWatcher = new FileWatcher();

module.exports = fileWatcher;