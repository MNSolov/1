const delayRequest = 1000;
const selectLevel = 5;

const input = document.querySelector( '.input' );

const sendRequest = debounceDecorator( send, delayRequest );

input.addEventListener( 'input', readFromInput );

async function readFromInput() {

    let text = this.value;
    let responce;

    try {
        
        responce = await sendRequest ( text );
    
    } catch( error ) {

        console.log ( error );
        responce = null;

        selectRemove( document.querySelector( '.select' ) );
        return;
    }
    
    if ( !responce ) return;

    let resultSearch = copyResultOfSearch ( responce, selectLevel, 'name', 'login', 'stargazers_count' );

    let select = createSelect( resultSearch );

    let selectClickResult = decoratorSelectClick ( selectClick, resultSearch );

    select.addEventListener( 'click', selectClickResult );
}

function selectClick ( event, resultSearch ) {

    selectRemove ( document.querySelector( '.select' ) );

    let objCard = resultSearch.find( item => item.name === event.target.textContent );

    console.log ( objCard );

    //console.log( event.target );
    //console.log( resultSearch );
}

function decoratorSelectClick ( callback, resultSearch ) {

    return function () {

        callback.call( this, ...arguments, resultSearch,  );
    }
    //event.target.classList.add( 'option--selected' );
}

function selectRemove( select ) {

    if ( select ) {

        select.remove();
    }
}

function createSelect( responce ) {

    
    let option;
    
    selectRemove( document.querySelector( '.select' ) );

    let select = document.createElement( 'select' );

    select.setAttribute( 'multiple', true );
    select.setAttribute( 'size', responce.length );

    for( let i = 0; i < responce.length; i++ ){

        option = document.createElement( 'option' );
        option.textContent = responce[i].name;
        option.classList.add( 'option' );
        select.append( option );
    }

    select.classList.add( 'select' );
    select.classList.add( 'main__select' );

    document.querySelector('.main').append(select);

    return select;
}

function debounceDecorator ( cb, delay ) {

    let timeoutHandler = null;

    return function() {
       
        let args = arguments;
        let context = this;

        return new Promise ( ( resolve, reject ) => {

            if( !timeoutHandler ) {

                timeoutHandler = setTimeout( () => {
                
                timeoutHandler = null;    
                //resolve (cb.apply( context, args).then( result => result, reject => reject ).catch( reject => reject ) );
                cb.apply( context, args).then( result => resolve( result ), error => reject( error ) );
            }, delay );
        } else {

            clearTimeout( timeoutHandler );
            timeoutHandler = setTimeout( () => {
               
                timeoutHandler = null;    
                //resolve ( cb.apply( context, args).then( result => result, reject => reject ).catch( reject => reject ) );
                cb.apply( context, args).then( result => resolve( result ), error => reject( error ) );
            }, delay );
        }
    });   
    }
}

async function send( message ){

    if ( !message ) {
    
        throw new RequestError ( "Строка запроса пуста", message );
    }

    if ( !message.match( /[\d,\w]/g ) ){

        throw new RequestError ( "Строка запроса содержит только пробелы", message );
    } 

    let url = new URL ( 'https://api.github.com/search/repositories' )

    url.searchParams.set( 'q', message );

    console.log ( url );

    let response = await fetch( url );
    
    if( response.ok ) {

        return response.json();
    
    } else {

        throw new HttpError ( 'Сетевая ошибка', response.status );
    }
}

class RequestError extends Error {

    constructor ( message, request ) {

        super ( message );
        this.name = "RequestError";
        this.request = request;
    }
}

class HttpError extends Error {

    constructor ( message, status ) {

        super ( message );
        this.name = "HttpError";
        this.status = status;
    }
}

function searchProperty ( obj, property, result ) {

    for ( let key in obj ) {

        if ( typeof ( obj[key] ) === 'object' ) {

            result = searchProperty( obj[key], property, result );
        }

        if ( key === property )
            return obj[key];
    }

    return result;
}

function copyObj( obj, ...args ) {

    let result = {};

    for ( let elem of args ) {

        result[elem] = searchProperty( obj, elem );
    }

    return result;
}

function copyResultOfSearch ( obj, length, ...property ) {

    let lengthCopy = ( obj.items.length > length ) ? length : obj.items.length;
    let result = [];

    for ( let i = 0; i < lengthCopy; i++ ) {

        result[i] = copyObj( obj.items[i], ...property )
    }

    return result;
}
