import PropTypes from "prop-types";
import Stack from "../hoc/Stack";

const Tile = ({selectedItem, item, handleChange }) => {
    
    return (
        <div className={selectedItem===item?.id?"tile_selected":"tile"} onClick={(e) => handleChange(e, item?.id)}>
        <Stack direction="row" spacing={1} key={`${item?.id}-${item.name}`}>
            {item.imageUrl && <img className='tile__image_display' src={item.imageUrl} alt={item.name} />}
            <div>
                <p className={selectedItem!==item?.id?"tile_header_selected":"tile_header"}>{item.name}</p>
                <p className="tile_desc">{item.description}</p>
            </div>
        </Stack>
        </div>
    )
}

Tile.propTypes = {
    selectedItem: PropTypes.number,
    item: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        imageUrl: PropTypes.string,
        description: PropTypes.string
    }),
    handleChange: PropTypes.func.isRequired
}
export default Tile;