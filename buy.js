const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageSelectMenu, MessageActionRow, MessageButton } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('ซื้อสินค้าในร้านค้า'),
    async execute(client, interaction) {
        const user_id = interaction.user.id;
        const stockdata = JSON.parse(fs.readFileSync("./db/stock.json", 'utf8'));
        const accdata = JSON.parse(fs.readFileSync("./db/acc.json", 'utf8'));
        
        if(!accdata[user_id]) return interaction.reply({ content: "คุณยังไม่มีบัญชีสมัครสมาชิก | /reg" });

        const nostock = new MessageEmbed()
        .setColor("RED")
        .setDescription("❌ | ไม่มีรายการสินค้าในคลัง!")

        if(Object.keys(stockdata).length == 0) return interaction.reply({ embeds: [nostock] });
        const sort = Object.keys(stockdata).sort((a, b) => stockdata[a].price - stockdata[b].price);
        var page = 0;

        const eiei = new MessageSelectMenu()
        .setCustomId("buy-menu")
        .setOptions(sort.map((item, index) => {
            return {
                label: `${stockdata[item].name} | ราคา: ${stockdata[item].price} บาท`,
                value: `${item}`
            }
        }))
        
        const sel = new MessageActionRow()
        .addComponents(eiei)

        const backback = new MessageButton()
        .setCustomId("backback")
        .setLabel("◀◀")
        .setStyle("SUCCESS")

        const nextnext = new MessageButton()
        .setCustomId("nextnext")
        .setLabel("▶▶")
        .setStyle("SUCCESS")

        const back = new MessageButton()
        .setCustomId("back")
        .setLabel("◀")
        .setStyle("SUCCESS")

        const next = new MessageButton()
        .setCustomId("next")
        .setLabel("▶")
        .setStyle("SUCCESS")

        const ok = new MessageButton()
        .setCustomId("ok")
        .setLabel("🛒")
        .setStyle("PRIMARY")

        const cancel = new MessageButton()
        .setCustomId("cel")
        .setLabel("❌")
        .setStyle("DANGER")

        const row = new MessageActionRow()
        .addComponents(back, ok, next)
        
        const row2 = new MessageActionRow()
        .addComponents(backback, cancel, nextnext)

        const succesbuy = new MessageEmbed()
        .setColor("GREEN")
        .setTitle("Succes Buy!")
        .setDescription(`✅ | \`ซื้อสินค้าเรียบร้อย! | โปรดเช็คในแชทส่วนตัว!\``)
        .setFooter({ text: '/buy' })
        .setTimestamp()

        const firstpage = new MessageEmbed()
        .setColor("RANDOM")
        .setTitle(`🛒 | คลังสินค้าของร้าน | ${page + 1}/${sort.length}`)
        .addFields(
            {
                name: `📌: ID`,
                value: `\`\`\`${sort[page]}\`\`\``,
                inline: false
            },
            {
                name: `🔰: ชื่อสินค้า`,
                value: `\`\`\`${stockdata[sort[page]].name}\`\`\``,
            },
            {
                name: `💳: ราคา`,
                value: `\`\`\`${stockdata[sort[page]].price}\`\`\``,
                inline: false
            }
        )
        .setImage(stockdata[sort[page]].img)
        .setFooter({ text: `/buy` })
        .setTimestamp()

        const msgdata = {
            embeds: [firstpage],
            components: [row, row2, sel],
            fetchReply: true,
            ephemeral: false
        }

        const msg = interaction.replied ? await interaction.followUp(msgdata) : await interaction.reply(msgdata);
        const filter = (interaction) => {
            if(interaction.user.id === user_id) return true;
            return interaction.reply({ content: "❌ | คุณไม่มีสิทธิ์ใช้งานปุ่มนี้!", ephemeral: true });
        }
        const col = msg.createMessageComponentCollector({
            filter,
            time: 300000
        });
        col.on('collect', async (i) => {
            i.deferUpdate();
            if(i.customId === "back") {
                if(page - 1 < 0) {
                    page = sort.length - 1
                } else {
                    page-=1;
                }
            }
            if(i.customId === "next") {
                if(page + 1 == sort.length) {
                    page = 0
                } else {
                    page+=1;
                }
            }
            if(i.customId === "next") {
                sendEmbed()
            }
            if(i.customId === "back") {
                sendEmbed()
            }
            if(i.customId === "backback") {
                page = 0;
                sendEmbed()
            }
            if(i.customId === "nextnext") {
                page = sort.length - 1;
                sendEmbed()
            }
            if(i.customId === "ok") {
                if(!sort[page]) return interaction.reply({ embeds: [nostock] });
                if(accdata[user_id].point < stockdata[sort[page]].price) return interaction.editReply({ embeds: [
                    new MessageEmbed()
                    .setColor("RED")
                    .setDescription(`❌ | \`เงินของคุณไม่เพียงพอคุณมี ${accdata[user_id].point} บาท\``)
                ], components: [] });
                accdata[user_id].point -= stockdata[sort[page]].price;
                fs.writeFileSync("./db/acc.json", JSON.stringify(accdata, null, 2));
                interaction.editReply({ embeds: [succesbuy], components: [] });
                const dm = new MessageEmbed()
                .setColor("RANDOM")
                .setTitle(`ขอบคุณที่ซื้อสินค้าของเรา!`)
                .addFields(
                    {
                        name: `📌: ID`,
                        value: `\`\`\`${sort[page]}\`\`\``,
                        inline: false
                    },
                    {
                        name: `🔰: ชื่อสินค้า`,
                        value: `\`\`\`${stockdata[sort[page]].name}\`\`\``,
                    },
                    {
                        name: `🔎: url`,
                        value: `\`\`\`${stockdata[sort[page]].nitro_url}\`\`\``,
                        inline: false
                    },
                    {
                        name: `💳: ราคา`,
                        value: `\`\`\`${stockdata[sort[page]].price}\`\`\``,
                        inline: false
                    }
                )
                .setImage(stockdata[sort[page]].img)
                .setFooter({ text: `/buy` })
                .setTimestamp()
                interaction.user.send({ embeds: [dm] });
                delete stockdata[sort[page]];
                fs.writeFileSync("./db/stock.json", JSON.stringify(stockdata, null, 2));
            }
            if(i.customId === "buy-menu") {
                sort.map((item, index) => {
                    if(i.values[0] === item) {
                        page = index;
                        sendEmbed();
                    }
                })
            }
            if(i.customId === "cel") {
                back.setDisabled(true),
                next.setDisabled(true),
                ok.setDisabled(true),
                cancel.setDisabled(true)
                eiei.setDisabled(true)
                nextnext.setDisabled(true)
                backback.setDisabled(true)
                sendEmbed()
            }
        });

        async function sendEmbed() {
            var embed = new MessageEmbed()
            .setColor("RANDOM")
            .setTitle(`🛒 | คลังสินค้าของร้าน | ${page + 1}/${sort.length}`)
            .addFields(
                {
                    name: `📌: ID`,
                    value: `\`\`\`${sort[page]}\`\`\``,
                    inline: false
                },
                {
                    name: `🔰: ชื่อสินค้า`,
                    value: `\`\`\`${stockdata[sort[page]].name}\`\`\``,
                },
                {
                    name: `💳: ราคา`,
                    value: `\`\`\`${stockdata[sort[page]].price}\`\`\``,
                    inline: false
                }
            )
            .setImage(stockdata[sort[page]].img)
            .setFooter({ text: `/buy` })
            .setTimestamp()
            interaction.editReply({ embeds: [embed], components: [row, row2, sel] });
        }
    }
}