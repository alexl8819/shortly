import PropTypes from 'prop-types';
import { useState, useEffect, type FC } from 'react';

interface CardProps {
	id: number,
	title: string,
	icon: string,
	alt: string,
	description: string
}

export const Card: FC<CardProps> = ({ id, title, icon, alt, description }) => {
	const [iconImg, setIconImg] = useState(null);

	useEffect(() => {
		const loadIcon = async (iconName: string) => {
			let loadedIcon = null;
			try {
				loadedIcon = await import(`../assets/icon-${iconName}.svg`);
			} catch (err) {
				console.error(err);
			}
			setIconImg(loadedIcon.default.src)
		};
		loadIcon(icon);
	}, [icon]);
	// TODO: use skeleton loader instead of null
	return (
		<li key={id} className={`lg:mb-0 mb-20 lg:w-2/6 lg:px-[0.938rem] xl:${id === 1 ? 'mt-6' : (id === 2 ? 'mt-8' : 'mt-0')}`}>
			<article className='flex flex-col lg:justify-start justify-center xl:items-start items-center xl:text-left text-center bg-white'>
				<div className='xl:ml-6 flex justify-center items-center rounded-full bg-dark-violet w-[5.5rem] h-[5.5rem] lg:-mt-12 -mt-10'>
					{ iconImg ? <img className='w-[2.5rem] h-[2.5rem]' src={iconImg} alt={alt} loading='lazy' /> : null }
				</div>
				<div className='p-7'>
					<h3 className='mt-[2.063rem] font-bold text-[1.375rem] text-very-dark-blue'>{ title }</h3>
					<p className='mt-3 leading-[1.625rem] text-[0.938rem] text-grayish-violet'>{ description }</p>
				</div>
			</article>
		</li>
	);
}

Card.propTypes = {
	id: PropTypes.number.isRequired,
	title: PropTypes.string.isRequired,
	icon: PropTypes.string.isRequired,
	alt: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired
};

export default Card;
