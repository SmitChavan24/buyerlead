export const Label = ({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) => (
  <label className="block font-medium mb-1">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);
