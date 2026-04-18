import Select from "react-select";


export const CROP_OPTIONS = [
  {
    label: "Grains",
    options: [
      "Rice",
      "Wheat",
      "Maize",
      "Millet",
      "Barley",
      "Sorghum",
      "Oats",
    ].map((crop) => ({ label: crop, value: crop })),
  },
  {
    label: "Pulses",
    options: [
      "Chickpea",
      "Lentil",
      "Pigeon Pea",
      "Green Gram",
      "Black Gram",
      "Pea",
    ].map((crop) => ({ label: crop, value: crop })),
  },
  {
    label: "Oilseeds",
    options: ["Groundnut", "Soybean", "Sunflower", "Mustard", "Sesame"].map((crop) => ({
      label: crop,
      value: crop,
    })),
  },
  {
    label: "Cash Crops",
    options: ["Cotton", "Sugarcane", "Jute"].map((crop) => ({ label: crop, value: crop })),
  },
  {
    label: "Vegetables",
    options: ["Tomato", "Potato", "Onion", "Brinjal", "Cabbage", "Cauliflower", "Okra"].map((crop) => ({
      label: crop,
      value: crop,
    })),
  },
  {
    label: "Fruits",
    options: ["Mango", "Banana", "Papaya", "Guava", "Grapes"].map((crop) => ({
      label: crop,
      value: crop,
    })),
  },
];

const cropSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "3.25rem",
    borderRadius: "1rem",
    borderColor: state.isFocused ? "#bef264" : "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.92)",
    boxShadow: state.isFocused ? "0 0 0 4px rgba(217,249,157,0.25)" : "none",
    color: "#1c1917",
    ":hover": {
      borderColor: "#bef264",
    },
  }),
  menu: (base) => ({
    ...base,
    zIndex: 50,
    borderRadius: "1rem",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.1)",
    backgroundColor: "#1c1917",
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: "18rem",
    padding: "0.5rem",
  }),
  groupHeading: (base) => ({
    ...base,
    color: "#a8a29e",
    letterSpacing: "0.16em",
    fontSize: "0.7rem",
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: "0.75rem",
    backgroundColor: state.isSelected
      ? "rgba(190,242,100,0.25)"
      : state.isFocused
        ? "rgba(255,255,255,0.1)"
        : "transparent",
    color: state.isSelected ? "#ecfccb" : "#e7e5e4",
    cursor: "pointer",
  }),
  multiValue: (base) => ({
    ...base,
    borderRadius: "999px",
    backgroundColor: "#d9f99d",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#1c1917",
    fontWeight: 600,
  }),
  multiValueRemove: (base) => ({
    ...base,
    borderRadius: "999px",
    color: "#44403c",
    ":hover": {
      backgroundColor: "#bef264",
      color: "#1c1917",
    },
  }),
  placeholder: (base) => ({
    ...base,
    color: "#78716c",
  }),
};


export default function CropMultiSelect({ value, onChange, maxSelections = 8, error = "" }) {
  const selectedOptions = value.map((crop) => ({ label: crop, value: crop }));

  const handleChange = (nextOptions) => {
    const nextValue = (nextOptions || []).map((option) => option.value);
    onChange(nextValue);
  };

  const isOptionDisabled = () => value.length >= maxSelections;

  return (
    <div className="space-y-2">
      <Select
        isMulti
        isSearchable
        closeMenuOnSelect={false}
        options={CROP_OPTIONS}
        value={selectedOptions}
        onChange={handleChange}
        isOptionDisabled={(option) => !value.includes(option.value) && isOptionDisabled()}
        styles={cropSelectStyles}
        placeholder={`Search and select crops (${value.length}/${maxSelections})`}
        classNamePrefix="crop-select"
      />
      {error ? <p className="text-sm text-amber-300">{error}</p> : null}
      <p className="text-xs text-stone-400">
        Searchable multi-select powered by react-select. Selected crops are shown as tags.
      </p>
    </div>
  );
}
