import PropTypes from 'prop-types';
import { Link, Button } from 'react-aria-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons';
// import { useEffect } from 'react';

interface NavLinks {
    links: Array<NavLink>
}

interface NavLink {
    url: string,
    label: string
}

const baseURL = import.meta.env.BASE_URL;

export default function Navbar ({ toggle, isOpen, links }: NavLinks) {
    return (
        <div className='lg:ml-12 lg:w-full w-auto'>
            <Button onPress={toggle} className="lg:hidden outline-none">
                <FontAwesomeIcon icon={faBars} size="2x" style={{color: '#9E9AA8'}} />
            </Button>

            <div className={`${isOpen ? 'absolute top-24 left-6 w-[89%] animate-fadeIn' : 'animate-fadeOut hidden'} lg:animate-none lg:flex lg:flex-row lg:items-center lg:bg-transparent bg-dark-violet lg:rounded-none rounded-lg`}>
                <nav className='lg:p-0 p-6 divide-y lg:divide-none divide-grayish-violet/25 flex lg:flex-row flex-col lg:justify-between justify-center items-center w-full' aria-label='main navigation'> 
                    <ul className='lg:mb-0 mb-[1.875rem] lg:w-[16.563rem] lg:space-x-7 list-none flex lg:flex-row flex-col lg:justify-start justify-center items-center'>
                    { 
                        links.map((link: NavLink, index: number) => (
                            <Link className='lg:mb-0 mb-[1.875rem] last:mb-0 font-bold text-[1.125rem] lg:text-grayish-violet text-white' key={index} href={link.url}>{link.label}</Link> )
                        ) 
                    }
                    </ul>
                    <div className='lg:pt-0 pt-8 lg:space-x-7 lg:w-auto flex lg:flex-row flex-col justify-center items-center text-center'>
                        <Link className='font-bold text-[1.125rem] lg:text-grayish-violet text-white' href='login'>Login</Link>
                        <Link className='lg:mt-0 mt-6 py-2 px-6 rounded-full bg-cyan font-bold text-[1.125rem] text-white w-full' href='sign-up'>Sign Up</Link>
                    </div>
                </nav>
            </div>
        </div>
    );
}

Navbar.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    links: PropTypes.arrayOf(PropTypes.object).isRequired
}