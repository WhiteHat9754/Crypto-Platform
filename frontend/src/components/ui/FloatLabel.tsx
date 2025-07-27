interface Props { 
  label: string; 
  htmlFor: string; 
}

export const FloatLabel = ({ label, htmlFor }: Props) => (
  <label
    htmlFor={htmlFor}
    className="
      pointer-events-none absolute left-3 top-2.5 origin-[0] 
      -translate-y-4 scale-75 transform text-xs text-slate-500 
      transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 
      peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-500
      dark:text-slate-400
    "
  >
    {label}
  </label>
);
