"use client";
import React, { useState } from "react";


interface PickerProps {
  title: string;
  value: number;
  options: number[];
  onSelect: (value: number) => void;
  onClose: () => void;
}

export default function PickerPopup({
  title,
  value,
  options,
  onSelect,
  onClose,
}: PickerProps) {
  const [selected, setSelected] = useState(value);

  return (
    <div className="picker-overlay">

      <div className="picker-modal">

        {/* Title */}
        <h3 className="picker-title">{title}</h3>

        {/* Wheel */}
        <div className="wheel-container">
          {options.map((num) => (
            <div
              key={num}
              className={`wheel-item ${
                num === selected ? "selected-item" : ""
              }`}
              onClick={() => setSelected(num)}
            >
              {num}
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="picker-buttons">
          <button className="picker-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="picker-confirm"
            onClick={() => {
              onSelect(selected);
              onClose();
            }}
          >
            Confirm
          </button>
        </div>

      </div>

    </div>
  );
}
