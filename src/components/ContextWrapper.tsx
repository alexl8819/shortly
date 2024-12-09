import LinkTable from '../components/LinkTable';
import ShortenerWidget from '../components/Shortener';
import { ShortenerProvider } from '../contexts/ShortenerContext';

export default function ShortenerContextWrapper () {
    return (
        <ShortenerProvider>
            <section className="my-6">
				<ShortenerWidget isLoggedIn={true} />
			</section>
            <section className='my-4'>
                <LinkTable />
            </section>
		</ShortenerProvider>
    );
}