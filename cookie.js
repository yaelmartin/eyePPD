// Function to set a cookie
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Function to get a cookie
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function clearCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// Function to check cookies and prompt user if empty
function checkCookies() {
    var value1 = getCookie('distance');
    var value2 = getCookie('windowWidth');

    if (!value1 || !value2) {
        while (valuesInvalid(value1,value2)) {
            value1 = parseFloat(prompt("Please enter a valid distance to screen (in cm):"));
            value2 = parseFloat(prompt("Please enter a valid window width (in cm):"));

            if(valuesInvalid(value1,value2)){
                alert('Invalid values, please retry');
            }
        }
    
        setCookie('distance', value1, 365);
        setCookie('windowWidth', value2, 365);
        alert('Values saved:\ndistance ' + value1 + 'cm\nwindow width ' + value2 + 'cm');
    } else {
        alert('Values from cookie:\ndistance ' + value1 + 'cm\nwindow width ' + value2 + 'cm' );
    }

    distanceViewCm = value1;
    sizeWindowWidthCm = value2;
}

function valuesInvalid(distance,witdh){
    return (isNaN(parseFloat(distance)) || isNaN(parseFloat(witdh)) || distance <= 0 || witdh <= 0);
}
