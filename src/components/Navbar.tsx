import PropTypes from 'prop-types';

import { Link } from 'react-aria-components';

interface NavLinks {
    links: Array<NavLink>
} 

interface NavLink {
    url: string,
    label: string
}

const baseURL = import.meta.env.BASE_URL;

export default function Navbar ({ links }: NavLinks) {
    return (
        <nav className='p-6 divide-y divide-grayish-violet/25 flex flex-col justify-center items-center w-full' aria-label='main navigation'>
            <ul className='mb-[1.875rem] list-none flex flex-col justify-center items-center'>
            { 
                links.map((link: NavLink, index: number) => (
                    <Link className='mb-[1.875rem] last:mb-0 font-bold text-[1.125rem] text-white' key={index} href={link.url}>{link.label}</Link> )
                ) 
            }
            </ul>
            <div className='pt-8 flex flex-col justify-center items-center text-center w-full'>
                <Link className='font-bold text-[1.125rem] text-white' href='login'>Login</Link>
                <Link className='mt-6 py-2 px-6 rounded-full bg-cyan font-bold text-[1.125rem] text-white w-full' href='sign-up'>Sign Up</Link>
            </div>
        </nav>
    );
}

Navbar.propTypes = {
    links: PropTypes.arrayOf(PropTypes.object)
}