import React from 'react';

const BackgroundBlobs = ({
  blobs = [],
  className = "",
  ...props
}) => {
  const defaultBlobs = [
    { position: "top-10 left-10", size: "w-64 h-64", color: "bg-secondary/10" },
    { position: "bottom-10 right-10", size: "w-80 h-80", color: "bg-pastel-pink/10" }
  ];

  const blobList = blobs.length > 0 ? blobs : defaultBlobs;

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none -z-10 ${className}`} {...props}>
      {blobList.map((blob, index) => (
        <div
          key={index}
          className={`absolute ${blob.position} ${blob.size} ${blob.color} rounded-full blur-3xl`}
        />
      ))}
    </div>
  );
};

export default BackgroundBlobs;