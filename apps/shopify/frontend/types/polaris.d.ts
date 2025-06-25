declare module '@shopify/polaris' {
  export interface SelectOption {
    label: string;
    value: string;
  }

  export interface ChoiceListChoice {
    label: string;
    value: string;
    helpText?: string;
  }

  export interface Props {
    children?: React.ReactNode;
  }

  export interface PageProps extends Props {
    title?: string;
    subtitle?: string;
    primaryAction?: any;
    secondaryActions?: any[];
  }

  export interface DataTableProps {
    columnContentTypes: Array<'text' | 'numeric' | 'date'>;
    headings: string[];
    rows: any[][];
  }

  export interface TabProps {
    id: string;
    content: string;
    accessibilityLabel: string;
    panelID: string;
  }

  export interface TabsProps {
    tabs: TabProps[];
    selected: number;
    onSelect: (selectedTabIndex: number) => void;
  }

  export interface BadgeProps extends Props {
    status?: 'success' | 'info' | 'attention' | 'critical' | 'warning' | 'new';
  }

  export interface ButtonGroupProps extends Props {
    vertical?: boolean;
  }

  export interface DatePickerProps {
    month: number;
    year: number;
    onChange: (date: { start: Date; end: Date }) => void;
    selected: { start: Date; end: Date };
  }

  export interface ThemeProps {
    logo: {
      width: number;
      topBarSource: string;
      contextualSaveBarSource: string;
      url: string;
      accessibilityLabel: string;
    };
  }

  export interface CardProps extends Props {
    sectioned?: boolean;
  }

  export interface LayoutProps extends Props {
    sectioned?: boolean;
  }

  export interface StackProps extends Props {
    vertical?: boolean;
    spacing?: 'tight' | 'loose' | 'extraTight';
    distribution?: 'equalSpacing' | 'leading' | 'trailing' | 'center' | 'fill';
    alignment?: 'leading' | 'trailing' | 'center' | 'fill' | 'baseline';
  }

  export interface ButtonProps extends Props {
    primary?: boolean;
    fullWidth?: boolean;
    onClick?: () => void;
  }

  export interface TextFieldProps {
    label: string;
    value: string;
    type?: string;
    onChange: (value: string) => void;
    helpText?: string;
  }

  export interface RangeSliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    output?: boolean;
    onChange: (value: number) => void;
    helpText?: string;
    disabled?: boolean;
  }

  export interface SelectProps {
    label: string;
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    helpText?: string;
  }

  export interface ChoiceListProps {
    title: string;
    choices: ChoiceListChoice[];
    selected: string[];
    onChange: (value: string[]) => void;
  }

  export interface ToastProps {
    content: string;
    error?: boolean;
    onDismiss: () => void;
  }

  export interface BannerProps extends Props {
    status?: 'info' | 'success' | 'warning' | 'critical';
  }

  export const Card: React.FC<CardProps>;
  export const Layout: React.FC<LayoutProps> & {
    Section: React.FC<LayoutProps & { secondary?: boolean }>;
  };
  export const FormLayout: React.FC<Props>;
  export const Select: React.FC<SelectProps>;
  export const TextField: React.FC<TextFieldProps>;
  export const Button: React.FC<ButtonProps>;
  export const Stack: React.FC<StackProps>;
  export const Heading: React.FC<Props>;
  export const TextStyle: React.FC<Props & { variation?: 'subdued' | 'strong' | 'positive' | 'negative' }>;
  export const RangeSlider: React.FC<RangeSliderProps>;
  export const ChoiceList: React.FC<ChoiceListProps>;
  export const Banner: React.FC<BannerProps>;
  export const Toast: React.FC<ToastProps>;
  export const Frame: React.FC<Props>;
  export const Page: React.FC<PageProps>;
  export const DataTable: React.FC<DataTableProps>;
  export const Tabs: React.FC<TabsProps>;
  export const Badge: React.FC<BadgeProps>;
  export const ButtonGroup: React.FC<ButtonGroupProps>;
  export const DatePicker: React.FC<DatePickerProps>;
  export const useTheme: () => ThemeProps;
}
