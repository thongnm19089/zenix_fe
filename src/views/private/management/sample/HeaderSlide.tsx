import React from 'react';
import { Carousel } from 'antd';

const contentStyle: React.CSSProperties = {
    width: '100%', // Image takes 100% of the container width
    height: '400px', // Set a fixed height for the images
    objectFit: 'cover', // Ensure the images cover the container without distortion
};

const HeaderSlide: React.FC = () => {
    return (
        <div className="carousel-container mb-2">
            <Carousel autoplay>
                <div>
                    <img src="https://banghieuviet.org/wp-content/uploads/2024/01/background-dep-05.jpg" alt="Slide 1" style={contentStyle} />
                </div>
                <div>
                    <img src="https://banghieuviet.org/wp-content/uploads/2024/01/background-dep-05.jpg" alt="Slide 2" style={contentStyle} />
                </div>
                <div>
                    <img src="https://banghieuviet.org/wp-content/uploads/2024/01/background-dep-05.jpg" alt="Slide 3" style={contentStyle} />
                </div>
                <div>
                    <img src="https://banghieuviet.org/wp-content/uploads/2024/01/background-dep-05.jpg" alt="Slide 4" style={contentStyle} />
                </div>
            </Carousel>
        </div>
    );
};

export default HeaderSlide;
