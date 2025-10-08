import ShowPasswordIcon from "./ShowPasswordIcon";

export default function ShowPasswordButton({
  togglePasswordVisibility,
}: {
  togglePasswordVisibility: () => void;
}) {
  return (
    <button
      type="button"
      onClick={() => togglePasswordVisibility()}
      className="absolute top-1/2 right-3 transform -translate-y-1/2"
    >
      <ShowPasswordIcon className="text-gray-500" />
    </button>
  );
}
