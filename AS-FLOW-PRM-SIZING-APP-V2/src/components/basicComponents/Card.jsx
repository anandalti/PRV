import { Card as MuiCard } from '@mui/material';

const Card = (props) => {
  return (
    <MuiCard {...props}>
        {props.children}
    </MuiCard>
  )
}

Card.propTypes = MuiCard.propTypes;

export default Card;