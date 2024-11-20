import PropTypes from 'prop-types';

import { Link } from 'react-aria-components';

interface NavLink {
    url: string,
    label: string
}

export default function Navbar ({ links }) {
  /*Login
  Sign Up*/
    return (
        <>
            <ol className="hidden">
                { 
                    links.map((link: NavLink, index: number) => <Link key={index} href={link.url}>{link.label}</Link> ) 
                }
            </ol>
        </>
    );
}

Navbar.propTypes = {
    links: PropTypes.arrayOf(PropTypes.object)
}