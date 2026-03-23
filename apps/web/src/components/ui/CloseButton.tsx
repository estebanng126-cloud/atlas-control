type CloseButtonProps = {
  onClick?: () => void;
  symbol?: string;
};

export function CloseButton({ onClick, symbol = "×" }: CloseButtonProps) {
  return (
    <button
      type="button"
      className="close-button"
      onClick={onClick}
      aria-label="Close"
    >
      {symbol}
    </button>
  );
}
