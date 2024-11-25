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
        <div className='xl:ml-12 xl:w-full w-auto'>
            <Button onPress={toggle} className="xl:hidden outline-none">
                <FontAwesomeIcon icon={faBars} size="2x" style={{color: '#9E9AA8'}} />
            </Button>

            <div className={`${isOpen ? 'absolute top-24 left-6 w-[89%] animate-fadeIn' : 'animate-fadeOut hidden'} xl:animate-none xl:flex xl:flex-row xl:items-center xl:bg-transparent bg-dark-violet xl:rounded-none rounded-lg`}>
                <nav className='xl:p-0 p-6 divide-y xl:divide-none divide-grayish-violet/25 flex xl:flex-row flex-col xl:justify-between justify-center items-center w-full' aria-label='main navigation'> 
                    <ul className='xl:mb-0 mb-[1.875rem] xl:w-[16.563rem] xl:space-x-7 list-none flex xl:flex-row flex-col xl:justify-start justify-center items-center'>
                    { 
                        links.map((link: NavLink, index: number) => (
                            <Link className='xl:mb-0 mb-[1.875rem] last:mb-0 font-bold text-[1.125rem] xl:text-grayish-violet text-white' key={index} href={link.url}>{link.label}</Link> )
                        ) 
                    }
                    </ul>
                    <div className='xl:pt-0 pt-8 xl:space-x-7 xl:w-auto flex xl:flex-row flex-col justify-center items-center text-center'>
                        <Link className='font-bold text-[1.125rem] xl:text-grayish-violet text-white' href='login'>Login</Link>
                        <Link className='xl:mt-0 mt-6 py-2 px-6 rounded-full bg-cyan font-bold text-[1.125rem] text-white w-full' href='sign-up'>Sign Up</Link>
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