const { MessageEmbed, MessageSelectMenu, MessageActionRow } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("bal")
    .setDescription("GG EZ"),
    async execute(client, interaction) {
    //ใช้ได้เฉพาะห้อง 968106436905295873
    if(interaction.channel.id !== '968106436905295873') return interaction.reply({ content: `❌ | ไปใช้ในห้อง <#968106436905295873> นะจ๊ะ`, ephemeral: true })
        const user_id = interaction.user.id;
        const accdata = JSON.parse(fs.readFileSync('./db/acc.json', 'utf8'));
    
        if(!accdata[user_id]) return interaction.reply({ content: "คุณยังไม่มีบัญชีสมัครสมาชิก | /reg" });

        const bal = new MessageEmbed()
        .setColor("GREEN")
        .setTitle(`บัญชีของคุณ`)
        .setDescription(`สวัสดีคุณ: \`${accdata[user_id].username}\``)
        .setFooter({ text: "/bal" })
        .setThumbnail(interaction.user.avatarURL())
        .setTimestamp();

        const balance = new MessageEmbed()
        .setColor("GOLD")
        .setDescription(`ยอดเงินคงเหลือ: \`${accdata[user_id].point}\` บาท`)

        const balanceall = new MessageEmbed()
        .setColor("GOLD")
        .setDescription(`ยอดเติมเงินสะสม: \`${accdata[user_id].pointall}\` บาท`)

        const sebal = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
            .setCustomId("bal-menu")
            .setOptions([
                {
                    label: "เงินคงเหลือ",
                    emoji: "💸",
                    value: "balan"
                },
                {
                    label: "เติมเงินสะสม",
                    emoji: "💰",
                    value: "balall"
                },
                {
                    label: "ยกเลิก",
                    emoji: "❌",
                    value: "cancel" 
                }
            ])
        )
        const msgdata = {
            embeds: [bal],
            components: [sebal],
            fetchReply: true,
            ephemeral: false
        }
        const msg = interaction.replied ? await interaction.followUp(msgdata) : await interaction.reply(msgdata);
        const col = msg.createMessageComponentCollector({
            filter: (i) => i.user.id == user_id,
            time: 300000
        });
        col.on('collect', async (i) => {
            i.deferUpdate();
            if(i.values[0] === "balan") {
                interaction.editReply({
                    embeds: [balance]
                });
            } else if (i.values[0] === "balall") {
                interaction.editReply({
                    embeds: [balanceall]
                });
            } else if (i.values[0] === "cancel") {
                interaction.deleteReply();
            }
        })
    }
}