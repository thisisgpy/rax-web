# Rax-Web

## Project Name
- For Chinese is 融安心
- For English is Rax

## Project Structure
- Source code in `src` directory
- Views in `src/views`
- Type definitions in `src/types`
- Router configuration in `src/router`
- API definitions in `src/api/swagger.json`
- Common components in `src/components`

## TypeScript Types Organization
- Type definitions centralized in `src/types`
- Each domain has its own `.d.ts` file
- Types must include purpose comments
- Related types grouped in same file

## Color Scheme
- Success: #67c23a (Green)
- Primary: #409eff (Blue)
- Warning: #e6a23c (Orange)
- Danger: #f56c6c (Red)

## Data Display
- Dates in yyyy-MM-dd format
- DateTimes in yyyy-MM-dd HH:mm:ss format
- Tables with fixed right action column
- Multiple actions in dropdown menu

## Responsive Design
- Sidebar: 200px expanded, 64px collapsed
- Use el-row and el-col for layouts
- Implement Element Plus responsive grid

## API Interface Definition
- All backend APIs' definitions in `src/api`
- Use OpenAPI/Swagger 3.0.0 format