/// <reference types="react" />

declare namespace JSX {
  interface IntrinsicElements {
    div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
    button: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
    input: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    select: React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
    form: React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
    label: React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
    img: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
    video: React.DetailedHTMLProps<React.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;
    canvas: React.DetailedHTMLProps<React.CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>;
  }
}

declare module 'react' {
  interface CSSProperties {
    [key: string]: string | number | undefined;
  }

  interface HTMLAttributes<T> {
    style?: CSSProperties;
    className?: string;
    id?: string;
  }

  interface FC<P = {}> {
    (props: P & { children?: ReactNode }): ReactElement | null;
  }

  type ReactNode = ReactElement | string | number | boolean | null | undefined | ReactNodeArray;
  interface ReactNodeArray extends Array<ReactNode> {}
  interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }
  type JSXElementConstructor<P> = ((props: P) => ReactElement<any, any> | null);
  type Key = string | number;

  // Hooks
  function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  function useCallback<T extends (...args: any[]) => any>(callback: T, deps: ReadonlyArray<any>): T;
  function useEffect(effect: () => void | (() => void), deps?: ReadonlyArray<any>): void;
  function useMemo<T>(factory: () => T, deps: ReadonlyArray<any> | undefined): T;
  function useRef<T>(initialValue: T): { current: T };
  function useContext<T>(context: React.Context<T>): T;

  // Context
  interface Context<T> {
    Provider: Provider<T>;
    Consumer: Consumer<T>;
    displayName?: string;
  }
  interface Provider<T> {
    (props: { value: T; children?: ReactNode }): ReactElement | null;
  }
  interface Consumer<T> {
    (props: { children: (value: T) => ReactNode }): ReactElement | null;
  }
  function createContext<T>(defaultValue: T): Context<T>;

  // Event Types
  interface ChangeEvent<T = Element> {
    target: T;
    currentTarget: T;
  }
  interface FormEvent<T = Element> {
    target: T;
    currentTarget: T;
  }
}
