import PropTypes from 'prop-types';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-aria-components';

interface NavLink {
    url: string,
    label: string
}

export default function Navbar ({ links }) {
    return (
        <>
            <div className="hidden">
                <ol className="list-none">
                    { 
                        links.map((link: NavLink, index: number) => <Link key={index} href={link.url}>{link.label}</Link> ) 
                    }
                </ol>
                <Link href="login">Login</Link>
                <Link href="sign-up">Sign Up</Link>
            </div>
            <div className="w-[24px]">
                <FontAwesomeIcon icon={faBars} size="sm" style={{color: '#9E9AA8'}} />
            </div>
        </>
    );
}

Navbar.propTypes = {
    links: PropTypes.arrayOf(PropTypes.object)
}