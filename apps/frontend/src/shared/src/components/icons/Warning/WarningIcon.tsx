const WarningIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={25}
      height={25}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx={12.422}
        cy={12.121}
        r={10}
        stroke="currentColor"
        strokeLinecap="square"
        strokeWidth={2}
      />
      <path
        stroke="currentColor"
        strokeLinecap="square"
        strokeWidth={2}
        d="M12.422 17.121v-6"
      />
      <circle cx={12.422} cy={7.371} r={1.25} fill="currentColor" />
    </svg>
  );
};

export default WarningIcon;
