interface ToastProps {
  readonly message: string | null;
}

export function Toast({ message }: ToastProps) {
  return (
    <div className={`toast${message ? " toast-visible" : ""}`}>
      {message}
    </div>
  );
}
