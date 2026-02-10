import { NextRequest, NextResponse } from 'next/server'
import { updateMenu, deleteMenu } from '@/lib/role'
import { prisma } from '@/lib/prisma'

// GET - ดึงข้อมูล menu
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const menuId = parseInt(params.id)
    
    if (isNaN(menuId)) {
      return NextResponse.json(
        { error: 'Invalid menu ID' },
        { status: 400 }
      )
    }

    const menu = await prisma.kaon_menu.findUnique({
      where: { id: menuId }
    })

    if (!menu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(menu)
  } catch (error) {
    console.error('Error fetching menu:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu' },
      { status: 500 }
    )
  }
}

// PUT - อัพเดท menu
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const menuId = parseInt(params.id)
    
    if (isNaN(menuId)) {
      return NextResponse.json(
        { error: 'Invalid menu ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { menuName, description, updatedby } = body

    const menu = await updateMenu(menuId, {
      menuName,
      description,
      updatedby
    })

    return NextResponse.json(menu)
  } catch (error) {
    console.error('Error updating menu:', error)
    return NextResponse.json(
      { error: 'Failed to update menu' },
      { status: 500 }
    )
  }
}

// DELETE - ลบ menu
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const menuId = parseInt(params.id)
    
    if (isNaN(menuId)) {
      return NextResponse.json(
        { error: 'Invalid menu ID' },
        { status: 400 }
      )
    }

    await deleteMenu(menuId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting menu:', error)
    return NextResponse.json(
      { error: 'Failed to delete menu' },
      { status: 500 }
    )
  }
}