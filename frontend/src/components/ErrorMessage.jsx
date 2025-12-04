import { ErrorIcon } from "./Icons";

export const ErrorMessage = ({ error }) => {
  if (!error) return null;

  return (
    <div className="error">
      <ErrorIcon />
      {error}
    </div>
  );
};
