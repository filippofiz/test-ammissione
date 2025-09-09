// Custom Dropdown Component with support for colors and categories
class CustomDropdown {
  constructor(container, options = {}) {
    this.container = container;
    this.value = options.value || '';
    this.placeholder = options.placeholder || 'Select...';
    this.onChange = options.onChange || (() => {});
    this.onBlur = options.onBlur || (() => {});
    this.items = options.items || [];
    this.id = options.id || 'custom-dropdown-' + Math.random().toString(36).substr(2, 9);
    
    this.isOpen = false;
    this.selectedIndex = -1;
    this.filteredItems = [...this.items];
    
    this.init();
  }
  
  init() {
    // Create HTML structure
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'custom-dropdown-wrapper';
    this.wrapper.style.cssText = 'position: relative; width: 100%;';
    
    // Input field
    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.className = 'custom-dropdown-input';
    this.input.placeholder = this.placeholder;
    this.input.value = this.value;
    this.input.style.cssText = `
      width: 100%;
      padding: 6px 30px 6px 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 13px;
      box-sizing: border-box;
      background: white;
    `;
    
    // Dropdown icon
    this.dropdownIcon = document.createElement('div');
    this.dropdownIcon.innerHTML = '▼';
    this.dropdownIcon.style.cssText = `
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      color: #666;
      font-size: 10px;
      transition: transform 0.2s;
    `;
    
    // Dropdown list
    this.dropdown = document.createElement('div');
    this.dropdown.className = 'custom-dropdown-list';
    this.dropdown.style.cssText = `
      position: absolute;
      top: 100%;
      right: 0;
      min-width: 350px;
      width: max-content;
      max-width: 500px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      max-height: 400px;
      overflow-y: auto;
      z-index: 1000;
      display: none;
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
      margin-top: 2px;
    `;
    
    // Assemble components
    this.wrapper.appendChild(this.input);
    this.wrapper.appendChild(this.dropdownIcon);
    this.wrapper.appendChild(this.dropdown);
    this.container.appendChild(this.wrapper);
    
    // Add CSS styles if not already present
    this.addStyles();
    
    // Bind events
    this.bindEvents();
    
    // Render initial items
    this.renderItems();
  }
  
  addStyles() {
    if (document.getElementById('custom-dropdown-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'custom-dropdown-styles';
    style.innerHTML = `
      .custom-dropdown-item {
        padding: 10px 16px;
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.2s;
        display: flex;
        align-items: center;
        border-bottom: 1px solid rgba(0,0,0,0.05);
      }
      
      .custom-dropdown-item:last-child {
        border-bottom: none;
      }
      
      .custom-dropdown-item:hover,
      .custom-dropdown-item.highlighted {
        background-color: #f5f5f5;
      }
      
      .custom-dropdown-item.selected {
        background-color: #e3f2fd;
        font-weight: 500;
      }
      
      .custom-dropdown-prefix {
        font-weight: 700;
        margin-right: 12px;
        font-size: 12px;
        padding: 3px 6px;
        border-radius: 4px;
        background: rgba(0,0,0,0.08);
        min-width: 45px;
        text-align: center;
      }
      
      .custom-dropdown-text {
        flex: 1;
      }
      
      .custom-dropdown-wrapper.open .custom-dropdown-list {
        display: block !important;
      }
      
      .custom-dropdown-wrapper.open > div:nth-child(2) {
        transform: translateY(-50%) rotate(180deg);
      }
      
      .custom-dropdown-no-results {
        padding: 12px;
        text-align: center;
        color: #999;
        font-style: italic;
        font-size: 13px;
      }
    `;
    document.head.appendChild(style);
  }
  
  bindEvents() {
    // Click on input to open/close
    this.input.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });
    
    // Typing to filter
    this.input.addEventListener('input', (e) => {
      this.filterItems(e.target.value);
      this.validate(e.target.value);
      if (!this.isOpen) this.open();
    });
    
    // Keyboard navigation
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!this.isOpen) {
          this.open();
        } else {
          this.highlightNext();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.isOpen) {
          this.highlightPrevious();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (this.isOpen && this.selectedIndex >= 0) {
          this.selectItem(this.filteredItems[this.selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        this.close();
      }
    });
    
    // Focus
    this.input.addEventListener('focus', () => {
      // Save current value
      this.input.setAttribute('data-current-value', this.input.value);
    });
    
    // Blur
    this.input.addEventListener('blur', (e) => {
      // Delay to allow click on items
      setTimeout(() => {
        if (!this.wrapper.contains(document.activeElement)) {
          this.close();
          // If empty, restore previous value
          if (!this.input.value && this.input.getAttribute('data-current-value')) {
            this.input.value = this.input.getAttribute('data-current-value');
          }
          this.validate(this.input.value);
          this.onBlur(this.input.value);
        }
      }, 200);
    });
    
    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!this.wrapper.contains(e.target)) {
        this.close();
      }
    });
  }
  
  filterItems(query) {
    const normalizedQuery = query.toLowerCase().trim();
    
    if (!normalizedQuery) {
      this.filteredItems = [...this.items];
    } else {
      this.filteredItems = this.items.filter(item => 
        item.value.toLowerCase().includes(normalizedQuery) ||
        (item.category && item.category.toLowerCase().includes(normalizedQuery))
      );
    }
    
    this.selectedIndex = -1;
    this.renderItems();
  }
  
  renderItems() {
    this.dropdown.innerHTML = '';
    
    if (this.filteredItems.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'custom-dropdown-no-results';
      noResults.textContent = 'No results found';
      this.dropdown.appendChild(noResults);
      return;
    }
    
    this.filteredItems.forEach((item, index) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'custom-dropdown-item';
      if (index === this.selectedIndex) {
        itemEl.classList.add('highlighted');
      }
      if (item.value === this.value) {
        itemEl.classList.add('selected');
      }
      
      // Prefix with color
      if (item.category) {
        const prefix = document.createElement('span');
        prefix.className = 'custom-dropdown-prefix';
        prefix.textContent = `[${item.category}]`;
        prefix.style.color = item.color || '#333';
        prefix.style.borderColor = item.color || '#333';
        itemEl.appendChild(prefix);
      }
      
      // Main text
      const text = document.createElement('span');
      text.className = 'custom-dropdown-text';
      text.textContent = item.value;
      text.style.color = item.color || '#333';
      itemEl.appendChild(text);
      
      // Click handler
      itemEl.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectItem(item);
      });
      
      // Hover handler
      itemEl.addEventListener('mouseenter', () => {
        this.selectedIndex = index;
        this.updateHighlight();
      });
      
      this.dropdown.appendChild(itemEl);
    });
  }
  
  highlightNext() {
    if (this.selectedIndex < this.filteredItems.length - 1) {
      this.selectedIndex++;
      this.updateHighlight();
      this.scrollToHighlighted();
    }
  }
  
  highlightPrevious() {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
      this.updateHighlight();
      this.scrollToHighlighted();
    }
  }
  
  updateHighlight() {
    const items = this.dropdown.querySelectorAll('.custom-dropdown-item');
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add('highlighted');
      } else {
        item.classList.remove('highlighted');
      }
    });
  }
  
  scrollToHighlighted() {
    const items = this.dropdown.querySelectorAll('.custom-dropdown-item');
    const highlighted = items[this.selectedIndex];
    if (highlighted) {
      highlighted.scrollIntoView({ block: 'nearest' });
    }
  }
  
  selectItem(item) {
    this.value = item.value;
    this.input.value = item.value;
    this.input.removeAttribute('data-current-value');
    this.validate(item.value); // Remove red when selecting a valid value
    this.close();
    this.onChange(item.value);
  }
  
  open() {
    this.isOpen = true;
    this.wrapper.classList.add('open');
    this.filterItems(this.input.value);
  }
  
  close() {
    this.isOpen = false;
    this.wrapper.classList.remove('open');
    this.selectedIndex = -1;
  }
  
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  
  getValue() {
    return this.value;
  }
  
  setValue(value) {
    this.value = value;
    this.input.value = value;
    this.validate(value);
  }
  
  validate(value) {
    const trimmedValue = value.trim();
    const validValues = this.items.map(item => item.value);
    const isValid = validValues.includes(trimmedValue) || trimmedValue === '';
    
    if (!isValid && trimmedValue !== '') {
      this.input.style.borderColor = '#f44336';
      this.input.style.backgroundColor = '#ffebee';
      this.input.title = '⚠️ Invalid value! Select an option from the list.';
    } else {
      this.input.style.borderColor = '#ddd';
      this.input.style.backgroundColor = 'white';
      this.input.title = '';
    }
    
    return isValid;
  }
  
  destroy() {
    this.wrapper.remove();
  }
}

// Export for use in other files
window.CustomDropdown = CustomDropdown;