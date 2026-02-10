type ToggleProps = {
    value: boolean
    onChange: (val: boolean) => void
}

export function Toggle({ value, onChange }: ToggleProps) {
    return (
        <button
            onClick={() => onChange(!value)}
            className={`w-10 h-5 flex items-center rounded-full px-0.5 transition
        ${value ? "bg-blue-500" : "bg-gray-300"}`}
        >
            <div
                className={`w-4 h-4  bg-white rounded-full shadow_toggle transform transition
          ${value ? "translate-x-5" : ""}`}
            />
        </button>
    )
}
