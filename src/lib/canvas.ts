// Copyright (C) 2022 Theros < MisModding | SvalTek >
// 
// This file is part of MisCord2.
// 
// MisCord2 is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// MisCord2 is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with MisCord2.  If not, see <http://www.gnu.org/licenses/>.

//const { fillWithEmoji } = require('discord-emoji-canvas');
import { MessageEmbed, /** Util **/ } from 'discord.js';
import canvas from 'canvas';
canvas.registerFont(__dirname + '/Fonts/JetBrains Mono Bold Nerd Font Complete.ttf', {
    family: 'jetbrains',
});
canvas.registerFont(__dirname + '/Fonts/Ubuntu-BoldItalic.ttf', {
    family: 'ubuntuBold',
});

export const embed = () => {
    return new MessageEmbed().setColor('BLURPLE');
}

