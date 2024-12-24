import { useState, type FC } from 'react';
import { Link } from 'react-aria-components';
import PropTypes from 'prop-types';

import logo from '../assets/logo.svg';
import Navbar from './Navbar.tsx';
import { type NavLink } from './Navbar.tsx';

const baseURL = import.meta.env.BASE_URL;

interface HeaderProps {
  links: Array<NavLink>,
  isLoggedIn: boolean
}

export const Header: FC<HeaderProps> = ({ links, isLoggedIn }) => {
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const toggleNav = () => setIsOpened(!isOpened);

  return (
    <header className={`mt-12 mb-0 lg:px-[7.375rem] xl:px-[10.375rem] px-6`}>
      <div className='flex flex-row lg:justify-start justify-between items-center'>
        <Link href={baseURL}>
          <img src={logo.src} alt="shortly - url shortener" loading="eager" />
        </Link>

        <Navbar isLoggedIn={isLoggedIn} isOpen={isOpened} toggle={toggleNav} links={links} />
      </div>
    </header>
  );
}

Header.propTypes = {
  links: PropTypes.arrayOf(PropTypes.any).isRequired,
  isLoggedIn: PropTypes.bool.isRequired
}

export default Header;