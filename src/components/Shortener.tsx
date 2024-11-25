import { 
    Button, 
    Form, 
    TextField,
    FieldError, 
    Label, 
    Input 
} from 'react-aria-components';
import delay from 'delay';
import { nanoid } from 'nanoid';
import clipboard from 'clipboardy';
import PropTypes from 'prop-types';
import { useState } from 'react';

interface ShortenedUrl {
    original: string,
    shortened: string
}

export default function ShortenerWidget () {
    const [longUrlInput,setLongUrlInput] = useState<string>('');
    const [shortenedLinks, setShortenedLinks] = useState<Array<ShortenedUrl>>([]);

    const queueLink = (e) => {
        e.preventDefault();

        if (!longUrlInput.length) {
            return;
        }
        
        setShortenedLinks((prev) => [...prev, {
            original: longUrlInput,
            shortened: `https://re.link/${nanoid(6)}`
        }]);
    };
    
    const handleInputChange = ({ target }) => {
        const longUrl = target.value;
        setLongUrlInput(longUrl);
    };

    return (
        <>
            <Form onSubmit={queueLink} className='xl:p-10 p-6 flex xl:flex-row flex-col bg-dark-violet rounded-xl bg-no-repeat bg-right-top lg:bg-bg-shorten-desktop bg-bg-shorten-mobile'>
                <TextField className='w-full' isRequired>
                    <Label htmlFor='link' className='sr-only'>Enter URL to shorten</Label>
                    <Input 
                        type='url' 
                        id='link' 
                        name='link' 
                        className='rounded outline-none py-3 px-6 xl:w-full xl:max-w-none max-w-[17.438rem] invalid:border-2 invalid:border-red'
                        //pattern='^https?:\\/\\/(?:www\\.)?[a-zA-Z0-9-]+\\.[a-zA-Z]{2,6}(?:\\/[^\\s]*)?$'
                        placeholder='Shorten a link here...'
                        onChange={handleInputChange}
                    />
                    <FieldError className='mt-[0.25rem] font-medium text-[0.75rem] tracking-[0.005em] leading-[1.125rem] text-red italic'>
                        {
                            ({validationDetails}) => (validationDetails.valueMissing || !validationDetails.valid ? 'Please enter a valid URL' : '')
                        }
                    </FieldError>
                </TextField>
                <Input type='submit' className='xl:mt-0 mt-4 xl:ml-6 py-3 xl:px-12 px-6 rounded bg-cyan text-white xl:w-auto w-full cursor-pointer' value='Shorten It!' />
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
    const [hasCopied, setHasCopied] = useState(false);

    const { original, shortened } = shorten;
    
    const copyShortened = async () => {
        setHasCopied(true);
        await clipboard.write(shortened);
        await delay(2500);
        setHasCopied(false);
    };
    
    return (
        <li key={shortened} className='mb-6 bg-white text-left'>
            <div className='mb-4 space-y-2 divide-y divide-grayish-violet'>
                <p className='font-medium text-[1rem] leading-9 text-very-dark-blue'>{ original }</p>
                <p className='pt-2 font-medium text-[1rem] text-cyan'>{ shortened }</p>
            </div>
            <Button 
                onPress={copyShortened} 
                className={`py-2 px-6 rounded-full ${hasCopied ? 'bg-dark-violet' : 'bg-cyan'} font-bold text-[1rem] text-white w-full`}
                isDisabled={hasCopied}
            >
                { hasCopied ? 'Copied!' : 'Copy' }
            </Button>
        </li>
    );
}

ShortenedLinkPreview.propTypes = {
    shorten: PropTypes.object.isRequired
};