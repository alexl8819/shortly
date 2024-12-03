import PropTypes from 'prop-types';
import { Link, Button, type PressEvent } from 'react-aria-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { type FC } from 'react';

export interface NavLinks {
    links: Array<NavLink>
}

export interface NavLink {
    url: string,
    label: string
}

const baseURL = import.meta.env.BASE_URL;

type ToggleFunction = (_e: PressEvent) => void;

interface NavbarProps {
    toggle: ToggleFunction,
    isOpen: boolean,
    links: Array<NavLink>
}

export const Navbar: FC<NavbarProps> = ({ toggle, isOpen, links }) => {
    return (
        <div className='lg:ml-12 lg:w-full w-auto'>
            <Button onPress={toggle} className="lg:hidden outline-none">
                <FontAwesomeIcon icon={faBars} size="2x" style={{color: '#9E9AA8'}} />
            </Button>

            <div className={`${isOpen ? 'absolute top-24 left-4 md:w-[95%] w-[91%] animate-fadeIn' : 'absolute top-24 left-4 md:w-[95%] w-[91%] animate-fadeOut hidden'} lg:relative lg:top-0 lg:left-0 lg:animate-none lg:flex lg:flex-row lg:items-center lg:bg-transparent bg-dark-violet lg:rounded-none rounded-lg`}>
                <nav className='lg:p-0 p-6 divide-y lg:divide-none divide-grayish-violet/25 flex lg:flex-row flex-col lg:justify-between justify-center items-center w-full' aria-label='main navigation'> 
                    <ul className='lg:mb-0 mb-[1.875rem] xl:w-[16.563rem] lg:space-x-7 list-none flex lg:flex-row flex-col lg:justify-start justify-center items-center'>
                    { 
                        links.map((link: NavLink, index: number) => (
                            <Link className='lg:mb-0 mb-[1.875rem] last:mb-0 font-bold text-[1.125rem] hover:text-very-dark-blue lg:text-grayish-violet text-white' key={index} href={baseURL + link.url}>{link.label}</Link> )
                        ) 
                    }
                    </ul>
                    <div className='lg:pt-0 pt-8 lg:space-x-7 lg:w-auto flex lg:flex-row flex-col justify-center items-center text-center'>
                        <Link className='font-bold text-[1.125rem] hover:text-very-dark-blue lg:text-grayish-violet text-white' href={baseURL + 'login'}>Login</Link>
                        <Link className='lg:mt-0 mt-6 py-2 px-6 rounded-full bg-cyan hover:bg-light-cyan font-bold text-[1.125rem] text-white w-full' href={baseURL + 'sign-up'}>Sign Up</Link>
                    </div>
                </nav>
            </div>
        </div>
    );
}

Navbar.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    links: PropTypes.arrayOf(PropTypes.any).isRequired
}

export default Navbar;