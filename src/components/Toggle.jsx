const Toggle = ({id, enabled, setter}) => {
  return (
    <div className="flex items-center">
      <label for={`${id}-toggle`} className="relative inline-block w-13 h-7 cursor-pointer">
        <input
          type="checkbox"
          className="peer sr-only"
          id={`${id}-toggle`}
          name={`${id}-enabled`}
          checked={enabled}
          onChange={(event) => setter(event.target.checked)}
        />
        <span className="absolute inset-0 bg-gray-200 rounded-full transition-colors duration-200 ease-in-out peer-checked:bg-blue-600 dark:bg-neutral-700 dark:peer-checked:bg-blue-500 peer-disabled:opacity-50 peer-disabled:pointer-events-none"></span>
        <span className="absolute top-1/2 start-0.5 -translate-y-1/2 size-6 bg-white rounded-full shadow-xs transition-transform duration-200 ease-in-out peer-checked:translate-x-full dark:bg-neutral-400 dark:peer-checked:bg-white"></span>
        <span className="absolute top-1/2 start-1 -translate-y-1/2 flex justify-center items-center size-5 text-gray-500 peer-checked:text-white transition-colors duration-200 dark:text-neutral-500">
          <svg
            className="shrink-0 size-3"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </span>
        <span className="absolute top-1/2 end-1 -translate-y-1/2 flex justify-center items-center size-5 text-gray-500 peer-checked:text-blue-600 transition-colors duration-200 dark:text-neutral-500">
          <svg
            className="shrink-0 size-3"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </span>
      </label>
    </div>
  );
};

export default Toggle;
