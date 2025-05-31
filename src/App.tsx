import { useEffect } from 'react';
import { GlobalStyle } from '@/styles';

function App() {
    useEffect(() => {
        console.log('Hello, World!');
    }, []);

    return (
        <>
            <GlobalStyle />
            <div>
                <h1>Crowdworks Assignment</h1>
            </div>
        </>
    );
}

export default App;
