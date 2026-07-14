import React from "react";

interface EditorialTextProps {
  text: string;
  italicClassName?: string;
}

/**
 * EditorialText
 *
 * A reusable component that takes a string containing *asterisks*
 * and renders the words inside the asterisks as italicized, brand-colored text.
 *
 * Example:
 * <EditorialText text="Find your next *legal opportunity* today" />
 */
export function EditorialText({ 
  text, 
  italicClassName = "text-brand italic font-bold" 
}: EditorialTextProps) {
  if (!text) return null;
  
  const parts = text.split("*");
  return (
    <>
      {parts.map((part, index) => {
        // Odd indices were wrapped in asterisks
        if (index % 2 === 1) {
          return (
            <span key={index} className={italicClassName}>
              {part}
            </span>
          );
        }
        return part;
      })}
    </>
  );
}

export default EditorialText;
