import { ComponentDefinition } from '@/types';

export const COMPONENT_LIBRARY: Record<string, ComponentDefinition> = {
  Button: {
    name: 'Button',
    allowedProps: ['variant', 'size', 'children', 'onClick', 'disabled'],
    props: {
      variant: ['primary', 'secondary', 'outline', 'ghost'],
      size: ['sm', 'md', 'lg'],
    },
    description: 'Interactive button component with variants',
  },
  Card: {
    name: 'Card',
    allowedProps: ['title', 'children', 'footer', 'variant'],
    props: {
      variant: ['default', 'elevated', 'outlined'],
    },
    description: 'Container component for content grouping',
  },
  Input: {
    name: 'Input',
    allowedProps: ['type', 'placeholder', 'label', 'value', 'onChange', 'disabled'],
    props: {
      type: ['text', 'email', 'password', 'number'],
    },
    description: 'Text input field with label',
  },
  Table: {
    name: 'Table',
    allowedProps: ['columns', 'data', 'striped', 'bordered'],
    props: {},
    description: 'Data table with columns and rows',
  },
  Modal: {
    name: 'Modal',
    allowedProps: ['isOpen', 'onClose', 'title', 'children', 'footer'],
    props: {},
    description: 'Overlay modal dialog',
  },
  Sidebar: {
    name: 'Sidebar',
    allowedProps: ['items', 'active', 'onItemClick', 'collapsed'],
    props: {},
    description: 'Navigation sidebar',
  },
  Navbar: {
    name: 'Navbar',
    allowedProps: ['logo', 'items', 'actions', 'variant'],
    props: {
      variant: ['light', 'dark'],
    },
    description: 'Top navigation bar',
  },
  Chart: {
    name: 'Chart',
    allowedProps: ['type', 'data', 'title', 'xAxis', 'yAxis'],
    props: {
      type: ['line', 'bar', 'pie', 'area'],
    },
    description: 'Chart component using recharts',
  },
};

export const COMPONENT_WHITELIST = Object.keys(COMPONENT_LIBRARY);

export function validateComponentUsage(code: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for inline styles
  if (code.includes('style={{') || code.includes('style={')) {
    errors.push('Inline styles are not allowed');
  }
  
  // Check for CSS generation patterns
  if (code.includes('className={`') || code.includes('className={\`')) {
    const arbitraryClassPattern = /className={\`[^}]*\$\{[^}]*\}[^}]*\`}/g;
    if (arbitraryClassPattern.test(code)) {
      errors.push('Dynamic Tailwind class generation is not allowed');
    }
  }
  
  // Extract component usage
  const componentPattern = /<(\w+)[\s>]/g;
  const matches = [...code.matchAll(componentPattern)];
  
  for (const match of matches) {
    const componentName = match[1];
    // Skip HTML elements and React fragments
    if (componentName === componentName.toLowerCase() || componentName === 'Fragment') {
      continue;
    }
    
    if (!COMPONENT_WHITELIST.includes(componentName)) {
      errors.push(`Unauthorized component: ${componentName}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
