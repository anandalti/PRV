import { Button } from 'react-bootstrap';

const IconButton = ({ name, svgPath, color, disabled, onClick }) => {
    return (
        <Button
            disabled={disabled}
            onClick={onClick}
            variant="link"
        >
            { svgPath 
                ? 
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill={color}
                    >
                        <path d={svgPath} />
                    </svg> 
                : 
                    name
            }
        </Button>
    );
}

export default IconButton;