'use strict';
const Command = require('common-bin');
const rd = require('rd');
const path = require('path');
const co = require('co');
const fs = require('mz/fs');
const regex = require('../regex');

class ParseCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);

    this.options = {
      path: {
        type: 'string',
        description: '目录地址',
      },
      filter: {
        type: 'string',
        description: '正则，例如匹配 js 文件 /\.js$/',
      },
    };
  }

  * run({ argv }) {
    const cwd = process.cwd();
    const dir = path.join(cwd, argv.path);
    const filter = argv.filter || '.';
    const files = [];
    let result = [];
    rd.eachFileFilterSync(dir, new RegExp(filter), file => {
      files.push(file);
    });
    co(function* () {
      result = yield files.map(function* (file) {
        const buffer = yield fs.readFile(file);
        const chinese = regex.parseChinese(buffer.toString('utf8'));
        return {
          path: file,
          chinese,
          count: chinese.length,
        };
      });
      console.log(result);
    });
  }

  get description() {
    return '解析所有中文字符';
  }
}

module.exports = ParseCommand;
