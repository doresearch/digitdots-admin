import * as path from 'path';
import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './book.entity';
import { Repository } from 'typeorm';
import EpubBook from './epub-book';

const AUTH_LIST = ['BusinessandManagement'];

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly repository: Repository<Book>,
  ) {}

  getBook(id) {
    const sql = `SELECT * FROM book WHERE id="${id}"`;
    return this.repository.query(sql);
  }

  async getCategoryAuth(userid) {
    // 获取用户对应的权限
    const userSql = `SELECT * FROM admin_user WHERE id = ${userid}`;
    const user = await this.repository.query(userSql);
    let [{ role }] = user;
    role = JSON.parse(role);
    role = role.map((item) => `"${item}"`);
    const authSql = `
        SELECT * FROM auth WHERE id IN (
            SELECT DISTINCT authId FROM role_auth WHERE roleId in (
                SELECT id FROM role WHERE \`name\` IN (${role.join(',')})))`;
    const authList = await this.repository.query(authSql);
    let categoryAuth = authList.filter((auth) => AUTH_LIST.includes(auth.key));
    categoryAuth = categoryAuth.map((category) => `"${category.key}"`);
    return categoryAuth;
  }

  async getBookList(params: any = {}, userid) {
    let page = +params.page || 1;
    let pageSize = +params.pageSize || 20;
    const { title = '', author = '' } = params;
    if (page <= 0) {
      page = 1;
    }
    if (pageSize <= 0) {
      pageSize = 20;
    }
    let where = 'where 1=1';
    if (title) {
      where += ` AND title LIKE '%${title}%'`;
    }
    if (author) {
      where += ` AND author LIKE '%${author}%'`;
    }
    const categoryAuth = await this.getCategoryAuth(userid);
    if (categoryAuth.length > 0) {
      where += ` AND categoryText IN (${categoryAuth.join(',')})`;
    }
    const sql = `select * from book ${where} limit ${pageSize} offset ${(page - 1) * pageSize}`;
    const res = await this.repository.query(sql);
    // console.log(res)
    return res
  }

  async countBookList(params: any = {}, userid) {
    const { title = '', author = '' } = params;
    let where = 'where 1=1';
    if (title) {
      where += ` AND title LIKE '%${title}%'`;
    }
    if (author) {
      where += ` AND author LIKE '%${author}%'`;
    }
    const categoryAuth = await this.getCategoryAuth(userid);
    if (categoryAuth.length > 0) {
      where += ` AND categoryText IN (${categoryAuth.join(',')})`;
    }
    const sql = `select count(*) as count from book ${where}`;
    return this.repository.query(sql);
  }

  uploadBook(file) {
    console.log(file);
    const destDir = '/opt/homebrew/var/www/upload';
    const destPath = path.resolve(destDir, file.originalname);
    fs.writeFileSync(destPath, file.buffer);
    // 电子书解析
    return this.parseBook(destPath, file).then((data) => {
      return {
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: destPath,
        dir: destDir,
        data,
      };
    });
  }

  parseBook(bookPath, file) {
    const epub = new EpubBook(bookPath, file);
    return epub.parse();
  }

  async updateBook(params) {
    const { id, title, author, category, categoryText, language, publisher } = params;
    const setSql = [];
    if (title) {
      setSql.push(`title="${title}"`);
    }
    if (author) {
      setSql.push(`author="${author}"`);
    }
    const updateSql = `UPDATE book SET ${setSql.join(',')} WHERE id=${id}`;
    return this.repository.query(updateSql);
  }

  async addBook(params) {
    const { title, author, fileName, category, categoryText, cover, language, publisher, rootFile } = params;
    const insertSql = `INSERT INTO book(
        fileName,
        cover,
        title,
        author,
        publisher,
        bookId,
        category,
        categoryText,
        language,
        rootFile
      ) VALUES(
        '${fileName}',
        '${cover}',
        '${title}',
        '${author}',
        '${publisher}',
        '${fileName}',
        '${category}',
        '${categoryText}',
        '${language}',
        '${rootFile}'
      )`;
    return this.repository.query(insertSql);
  }

  async deleteBook(id) {
    const deleteSql = `DELETE FROM book WHERE id = ${id}`;
    return this.repository.query(deleteSql);
  }
}
