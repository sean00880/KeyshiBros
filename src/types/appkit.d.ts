declare namespace JSX {
  interface IntrinsicElements {
    'appkit-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      balance?: string;
      size?: string;
    }, HTMLElement>;
    'appkit-wallet-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      wallet?: string;
      namespace?: string;
    }, HTMLElement>;
    'appkit-network-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'appkit-connect-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'appkit-account-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  }
}
