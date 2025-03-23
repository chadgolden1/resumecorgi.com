import { ChangeEvent } from 'react';

interface FormDataInput {
  id: string;
  name: string;
  value: string;
}

interface InputProps {
  containerClassName?: string;
  type?: string;
  label: string;
  placeholder?: string;
  formData: FormDataInput;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

function Input({
  containerClassName = "",
  type = "text",
  label,
  placeholder = "",
  formData,
  handleChange
}: InputProps) {
  return(
    <>
      <div className={containerClassName}>
        <label htmlFor={formData.id} className="block text-sm text-gray-800 dark:text-zinc-200 mb-1">{ label }</label>
        <div className="relative inline-block w-full group mb-3">
          <input
            type={type}
            id={formData.id}
            name={formData.name}
            value={formData.value}
            onChange={handleChange}
            autoComplete="off"
            className="transition-colors duration-50 relative w-full p-2 text-sm text-black dark:text-white 
                       bg-gray-50 dark:bg-zinc-800
                       border-1 border-gray-200 dark:border-zinc-700 rounded-lg
                       hover:border-purple-200 dark:hover:border-purple-700
                       hover:bg-purple-100 dark:hover:bg-purple-900/50
                       focus:outline-purple-600/75 focus:outline-3 focus:border-purple-600/75 focus:ring-purple-600/75 dark:focus:border-purple-600/75 dark:focus:border-transparent
                       focus:bg-purple-100 dark:focus:bg-purple-950/75"
            placeholder={placeholder}
          />
        </div>
      </div>
    </>
  )
}

export default Input