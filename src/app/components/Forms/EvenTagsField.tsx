"use client";
import { useState, useEffect } from "react";

const TAG_OPTIONS = [
  "Trail Run",
  "Road Run",
  "Social",
  "Outdoor",
  "Beginner",
  "Intermediate",
  "Advanced",
  "Competition",
];

type Props = {
  name: string;
  maxTags?: number;
  initialTags?: string[];
  resetKey?: number;
};

export default function EventTagsField(props: Props) {
  const { initialTags = [], resetKey, maxTags = 3, name } = props;
  const [selected, setSelected] = useState<string[]>(initialTags);

  // Pre-fill (or clear) when initialTags or resetKey changes
  useEffect(() => {
    setSelected(initialTags ?? []);
  }, [initialTags, resetKey]);

  const handleChange = (tag: string) => {
    if (selected.includes(tag)) {
      setSelected(selected.filter((t) => t !== tag));
    } else if (selected.length < maxTags) {
      setSelected([...selected, tag]);
    }
  };

  return (
    <div className="inputRow fp-col">
      <label className="rcForm__label h5">Tags (select up to {maxTags})</label>
      <div className="rcForm__checkboxGroup fp-row" role="group">
        {TAG_OPTIONS.map((tag) => (
          <label key={tag} className="rcForm__checkboxLabel txt-body">
            <input
              type="checkbox"
              name={name}
              value={tag}
              checked={selected.includes(tag)}
              onChange={() => handleChange(tag)}
              disabled={!selected.includes(tag) && selected.length >= maxTags}
            />
            <span>{tag}</span>
          </label>
        ))}
      </div>
    </div>
  );
}