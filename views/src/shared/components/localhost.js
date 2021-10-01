const get_ip = (device_type) => {
    let ip;
    switch (device_type) {
        case 'pc':
            ip = "127.0.0.1";   // localhost
            break;
        case 'mobile':
            ip = "192.168.178.45";  // IP of your PC on the same network with your mobile phone
            break;
        case 'deploy':
            ip = "everyshift.herokuapp.com/";   // localhost
            break;
        default:
            ip = "10.0.2.2";    // localhost on Android simulator devices
            break;
    }
    return ip;
} ;

const device_type = 'deploy';

export { get_ip, device_type }