import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import ToolTip from "./ToolTip";

const ImageView = ({
  fieldName,
  src,
  source_type = "url",
  alt = "Image",
  fallbackSrc = "",
  className = "",
  style = {},
  imageStyle = {},
  onError,
  onLoad,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(fallbackSrc || src);

  const handleImageError = () => {
    setCurrentSrc(fallbackSrc || "");
    onError?.({ name: fieldName, src: currentSrc });
  };

  const handleImageLoad = () => {
    onLoad?.({ name: fieldName, src: currentSrc });
  };

  useEffect(() => {
    if (source_type === "url") {
      setCurrentSrc(src);
    } else if (source_type === "base64" && src) {
      setCurrentSrc(src);
    } else {
      setCurrentSrc(fallbackSrc || "");
    }
  }, [src, source_type, fallbackSrc]);

  return (
    <div style={style}>
      <ToolTip {...props} fieldName={fieldName}>
        <img
          className={`${className} app-dynamic-image`.trim()}
          name={fieldName}
          src={currentSrc}
          alt={alt}
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{ display: "block", maxWidth: "100%", height: "auto", ...imageStyle }}
        />
      </ToolTip>
    </div>
  );
};

ImageView.propTypes = {
  className: PropTypes.string,
  fieldName: PropTypes.string,
  src: PropTypes.string.isRequired,
  source_type: PropTypes.oneOf(["url", "base64"]),
  alt: PropTypes.string,
  fallbackSrc: PropTypes.string,
  onError: PropTypes.func,
  onLoad: PropTypes.func,
  style: PropTypes.object,
  imageStyle: PropTypes.object,
};

export default ImageView;