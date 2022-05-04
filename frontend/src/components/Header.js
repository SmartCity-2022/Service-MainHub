import PropTypes from 'prop-types';
import Button from './Button';

const Header = (props) => {
    const onClick = () => {
        console.log('clicked');
    }

    return (
        <header className='header'>
            <h1 style={headingStyle}>{props.title}</h1>
            <Button color='red'  text='Add' onClick={onClick} />
        </header>
    )
}

Header.defaultProps = {
    title: 'Service-Hub'
}

Header.propTypes = {
    title: PropTypes.string.isRequired
}

const headingStyle = {
    color: 'red', 
    backgroundColor: 'black'
}

export default Header;