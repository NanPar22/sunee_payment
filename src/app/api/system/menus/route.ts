import { createMenu, getAllMenus } from '@/lib/role'
import { NextRequest, NextResponse } from 'next/server'

// GET - ดึง menus ทั้งหมด
export async function GET() {
  try {
    const menus = await getAllMenus()
    return NextResponse.json(menus)
  } catch (error) {
    console.error('Error fetching menus:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menus' },
      { status: 500 }
    )
  }
}

// POST - สร้าง menu ใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { menuName, description, person } = body

    if (!menuName) {
      return NextResponse.json(
        { error: 'menuName is required' },
        { status: 400 }
      )
    }

    const menu = await createMenu({ menuName, description, person })
    return NextResponse.json(menu, { status: 201 })
  } catch (error) {
    console.error('Error creating menu:', error)
    return NextResponse.json(
      { error: 'Failed to create menu' },
      { status: 500 }
    )
  }
}