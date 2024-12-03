// md to xml 
import { parse } from 'marked';
import xml from 'xml-js';

export const mdToXml = (md: string) => {
  const html = parse(md);
  // fix 
  return xml.json2xml(html, { compact: false, spaces: 2 })}

  ;