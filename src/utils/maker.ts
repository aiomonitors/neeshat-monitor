import request from 'request-promise-native';

interface Field {
    name: string;
    value: string;
    inline: boolean;
}

interface Image {
    url: string;
}

type Timestamp = Date;

interface Footer {
    text: string;
    icon_url?: string;
}

interface Author {
    name: string;
    icon_url?: string;
    url?: string;
}

export interface IEmbed {
    title: string;
    description?: string | null;
    url?: string | null;
    color?: number;
    author?: Author;
    fields?: Field[];
    footer?: Footer;
    timestamp?: Timestamp;
    thumbnail?: Image;
    image?: Image;
}

class Embed {
    embed: IEmbed;
    title: string;
    description: string;
    icon: string;

    constructor(title: string, description: string = null, url: string = null) {
        this.title = title;
        this.description = description
        
        this.embed = {
            title: this.title,
            url: url,
            description: this.description,
        };
    }

    addField (name: string, value: string, inline: boolean = false) {
        var field = {
            name : name,
            value : value,
            inline : inline
        }
        if (!this.embed['fields']) {
            this.embed['fields'] = []
        }
        this.embed['fields'].push(field)
        return this;
    };

    setColor(color: string) {
        this.embed.color = parseInt(`0x${color.replace("#", "")}`)
        return this;
    }
    

    setFooter (text: string, icon: string = null) {
        this.embed.footer = {
            text : text,
            icon_url : icon
        }
        return this;
    };

    setTimestamp (value: Date = new Date()) {
        this.embed.timestamp = value
        return this;
    };

    setThumbnail (url: string) { 
        this.embed.thumbnail = {
            url : url
        }
        return this;
    };

    setImage (url: string) {
        this.embed.image = {
            url : url
        }
        return this;
    };

    setAuthor (name: string, url: string = null, icon: string = null) {
        if (!icon && this.icon != null) {icon = this.icon} else if (icon != null) {icon = icon}
        this.embed.author = {
            name : name,
            icon_url : icon,
            url : url
        }
        return this;
    };

    show () {
        console.log(this.embed)
    };

    getEmbed () {
        return this.embed;
    }

    async send (webhook: string) {
        let res = await request.post(webhook, {
            headers: {
                'Content-Type': 'application/json'
            },
            json: {embeds : [this.getEmbed()]},
            resolveWithFullResponse: true
        });
    }
}

export default Embed;