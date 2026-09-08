// Code: This file contains the images for the world map in the Calculate Flow Rate page.
import React from 'react';
import CustomToolTip from '../basicComponents/ToolTip';
const WorldMapImages = (props) => {
  const images = [
      { src: 'src/assets/worldMap/Above58_01.jpg', alt: 'Above 58°', tooltip: 'Above 58°' },
      { src: 'src/assets/worldMap/Between42and58_01.jpg', alt: 'Between 42° and 58°', tooltip: 'Between 42° and 58°' },
      { src: 'src/assets/worldMap/Below42.jpg', alt: 'Below 42°', tooltip: 'Below 42°' },
      { src: 'src/assets/worldMap/Between42and58_02.jpg', alt: 'Between 42° and 58°', tooltip: 'Between 42° and 58°' },
      { src: 'src/assets/worldMap/Above58_02.jpg', alt: 'Above 58°', tooltip: 'Above 58°' },
    ];
    
  return (
    <div style={styles.galleryContainer}>
      {images.map((image, index) => (
        <CustomToolTip key={index} infoText={image.tooltip} type="image">
            <img
            key={index}
            src={image.src}
            alt={image.alt}
            onClick={() => props.handleClick(image.alt)}
            style={index === 1 ? { ...styles.image, ...styles.secondImage } : styles.image}
        />
        </CustomToolTip>
      ))}
    </div>
  );
};

const styles = {
  galleryContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginTop: '20px',
  },
  image: {
    maxWidth: '700px',
    margin: '0px',
  },
  secondImage: {
    marginLeft: '3px',
    //width: 'calc(100% + 3px)',
  },
};

export default WorldMapImages;
