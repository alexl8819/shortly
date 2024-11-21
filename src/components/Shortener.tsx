import { 
    Button, 
    Form, 
    TextField, 
    Label, 
    Input 
} from 'react-aria-components';
import clipboard from 'clipboardy';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

interface ShortenedUrl {
    original: string,
    shortened: string
}

export default function ShortenerWidget () {
    const [shortenedLinks, setShortenedLinks] = useState<Array<ShortenedUrl>>([]);
    useEffect(() => {
        setShortenedLinks([
            {
                original: 'https://test.com',
                shortened: 'https://re.link/k4lKyk'
            }
        ])
    }, []);
    return (
        <>
            <Form className='p-6 bg-dark-violet rounded-lg bg-no-repeat bg-right-top bg-bg-shorten'>
                <TextField>
                    <Label className='sr-only'>Enter URL to shorten</Label>
                    <Input className='rounded py-3 px-6 max-w-[17.438rem]' placeholder='Shorten a link here...' />
                </TextField>
                <Button className='mt-4 py-3 px-6 rounded bg-cyan text-white w-full'>Shorten It!</Button>
            </Form>
            <ul className='mt-6 list-none'>
                { 
                    shortenedLinks.map((shorten: ShortenedUrl) => (<ShortenedLinkPreview shorten={shorten} />))
                }
            </ul>
        </>
    )
}

function ShortenedLinkPreview ({ shorten }) {
    const { original, shortened } = shorten;
    const copyShortened = async () => await clipboard.write(shortened);
    return (
        <li key={shortened} className='bg-white text-left'>
            <div className='mb-4 space-y-2 divide-y divide-grayish-violet'>
                <p className='font-medium text-[1rem] leading-9 text-very-dark-blue'>{ original }</p>
                <p className='pt-2 font-medium text-[1rem] text-cyan'>{ shortened }</p>
            </div>
            <Button onPress={copyShortened} className='py-2 px-6 rounded-lg bg-cyan font-bold text-[1rem] text-white w-full'>Copy</Button>
        </li>
    );
}

ShortenedLinkPreview.propTypes = {
    shorten: PropTypes.object.isRequired
};